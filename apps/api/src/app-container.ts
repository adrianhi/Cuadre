import { AnalyticsService } from './modules/analytics/application/analytics.service';
import { PrismaAnalyticsRepository } from './modules/analytics/infrastructure/prisma-analytics.repository';
import { AnalyticsController } from './modules/analytics/http/analytics.controller';
import { CategoryRuleApplicationService, PrismaCategoryRuleRepository, CategoryRuleController,
  SaveCategoryRule, ListExpenseCategories, ListTransactionCategories, PrismaRuleCatalog, CategorizeTransaction,
  PrismaRuleApplications, ProcessRuleApplication, RuleApplicationRunner, RuleApplicationController,
  PreviewRuleApplication, ConfirmRuleApplication, RetryRuleApplication, PrismaRuleApplicationUnit } from './modules/categorization';
import { PrismaClassificationCandidates, PrismaClassificationWriter, PrismaWorkspaceHolderNameReader } from './modules/transactions';
import { TransactionApplicationService } from './modules/transactions/application/transaction-application.service';
import { TransactionHttpController } from './modules/transactions/http/transaction.controller';
import { ReadinessController } from './modules/system/http/readiness.controller';
import { PrismaReadinessRepository } from './modules/system/infrastructure/prisma-readiness.repository';
import { IdentityApplicationService } from './modules/identity/application/identity.service';
import { PrismaProfileRepository } from './modules/identity/infrastructure/prisma-profile.repository';
import { IdentityController } from './modules/identity/http/identity.controller';
import { FinancialReportService } from './modules/reports/application/financial-report.service';
import { FinancialReportController } from './modules/reports/http/financial-report.controller';
import { config } from './config';
import { GoogleGmailClient } from './modules/connections/infrastructure/google/google-gmail.client';
import { GmailTokenProvider } from './modules/connections/infrastructure/gmail-token.provider';
import { GmailQueryService } from './modules/connections/infrastructure/gmail-query.service';
import { PrismaGmailConnectionReader } from './modules/connections/infrastructure/prisma-gmail-connection.reader';
import { GmailLifecycleService } from './modules/connections/infrastructure/gmail-lifecycle.service';
import {
  GmailJobHandlerRegistry, GmailMessageProcessor, GmailSyncService, HandleGmailPush,
  IngestionJobService, IngestionScheduler, PrismaInboxConnectionRepository,
  PrismaSyncCompletedContextReader, SyncCompletedNotifier, GoogleOidcAdapter,
} from './modules/ingestion';
import { IngestionRunner } from './ingestion/ingestion-runner';
import { GmailPubSubController } from './controllers/gmail-pubsub.controller';
import { InboxConnectionController } from './controllers/inbox-connection.controller';
import { InstitutionSelectionService } from './modules/connections/infrastructure/institution-selection.service';
import { MaintenanceController } from './controllers/maintenance.controller';
import { AccountService } from './modules/account/infrastructure/account.service';
import { AccountController } from './controllers/account.controller';
import { LegalService } from './modules/legal/infrastructure/legal.service';
import { WorkspaceService } from './modules/identity/infrastructure/workspace.service';
import { PrismaTransactionWriter } from './modules/transactions/infrastructure/prisma-transaction.writer';
import { PrismaTransactionQuery } from './modules/transactions/infrastructure/prisma-transaction.query';
import { PrismaReversalService } from './modules/transactions/infrastructure/prisma-reversal.service';
import { NormalizedEmailProcessor } from './modules/ingestion/infrastructure/normalized-email.processor';
import { FinancialInstitutionService } from './modules/connections/infrastructure/financial-institution.service';
import { BankConnectionController } from './controllers/bank-connection.controller';
import { LegalController } from './controllers/legal.controller';
import {
  BudgetController, GetMonthlyBudget, ListBudgetCategories, PrismaBudgetExpenseReadModel,
  PrismaBudgetRepository, ReplaceMonthlyBudget, SuggestBudget, GetSafeToSpend,
  PrismaSafeToSpendExpenseReader,
} from './modules/budgets';
import { IncomeController, IncomeService, PrismaIncomeRepository } from './modules/incomes';
import {
  PrismaRecurringRepository, ProcessRecurringScan, RecurringController,
  RecurringJobService, RecurringRunner, RecurringService,
} from './modules/recurring';
import { EngagementController, EngagementService, PrismaEngagementRepository } from './modules/engagement';
import {
  PaydayRitualController, PaydayRitualService, PrismaPaydayExpenseReader,
  PrismaPaydayIncomeReader, PrismaPaydayReviewRepository,
} from './modules/payday-ritual';
import {
  EmailNotificationController, EmailTransportService, PrismaEmailRepository, PrismaProactiveRepository,
  ProactiveController, ProactiveEmailRunner, ProactiveEmailScheduler, ProactiveEmailService,
  ProactiveEngineService, WeeklyEmailBuilder,
} from './modules/proactivity';
import {
  BetaInterestController, BetaInterestService, BetaInviteService,
  PrismaBetaInterestRepository, PrismaBetaInviteRepository,
} from './modules/auth';
import { RunnerLoopControl, type RunnerDelays } from './shared/application/runner-loop-control';

const runnerDelays: RunnerDelays = { idleDelayMs: config.workerIdleDelayMs,
  busyDelayMs: config.workerBusyDelayMs, errorDelayMs: config.workerErrorDelayMs };

const analyticsService = new AnalyticsService(new PrismaAnalyticsRepository());
const incomeRepository = new PrismaIncomeRepository();
const incomeService = new IncomeService(incomeRepository, analyticsService);
const incomeController = new IncomeController(incomeService);
const ruleRepository = new PrismaCategoryRuleRepository();
const ruleCatalog = new PrismaRuleCatalog();
const expenseCategories = new ListExpenseCategories(ruleCatalog);
const transactionCategories = new ListTransactionCategories(ruleCatalog);
const categorizer = new CategorizeTransaction(ruleRepository);
const ruleApplications = new PrismaRuleApplications((tx) => new PrismaClassificationWriter(tx));
const ruleApplicationControl = new RunnerLoopControl();
const ruleApplicationUnit = new PrismaRuleApplicationUnit(() => ruleApplicationControl.notifyWork());
const previewRuleApplication = new PreviewRuleApplication(ruleApplicationUnit, ruleApplications);
const confirmRuleApplication = new ConfirmRuleApplication(ruleApplicationUnit, ruleApplications);
const retryRuleApplication = new RetryRuleApplication(ruleApplicationUnit, ruleApplications);
const ruleApplicationRunner = new RuleApplicationRunner(new ProcessRuleApplication(
  ruleApplications, new PrismaClassificationCandidates()), runnerDelays, ruleApplicationControl);
const budgetRepository = new PrismaBudgetRepository();
const budgetExpenses = new PrismaBudgetExpenseReadModel();
const budgetCategories = new ListBudgetCategories(budgetExpenses, expenseCategories);
const getMonthlyBudget = new GetMonthlyBudget(budgetRepository, budgetExpenses);
const engagementService = new EngagementService(new PrismaEngagementRepository());
const recurringRepository = new PrismaRecurringRepository();
const recurringService = new RecurringService(recurringRepository, engagementService);
const recurringJobService = new RecurringJobService(new ProcessRecurringScan(recurringRepository));
const recurringRunner = new RecurringRunner(recurringJobService, runnerDelays, new RunnerLoopControl());
const getSafeToSpend = new GetSafeToSpend(
  budgetRepository,
  new PrismaSafeToSpendExpenseReader(),
  recurringService,
);
const paydayRitualService = new PaydayRitualService(
  new PrismaPaydayIncomeReader(), new PrismaPaydayExpenseReader(), recurringService,
  new PrismaPaydayReviewRepository(), engagementService,
);
const budgetController = new BudgetController({
  getMonthly: getMonthlyBudget,
  replaceMonthly: new ReplaceMonthlyBudget(budgetRepository, budgetCategories, getMonthlyBudget),
  suggest: new SuggestBudget(budgetExpenses, budgetCategories),
  listCategories: budgetCategories,
  safeToSpend: getSafeToSpend,
});
const categoryRuleService = new CategoryRuleApplicationService(ruleRepository,
  new SaveCategoryRule(ruleRepository, transactionCategories, ruleCatalog), transactionCategories, ruleCatalog);
const transactionWriter = new PrismaTransactionWriter(
  categorizer,
  new PrismaReversalService(),
  new PrismaWorkspaceHolderNameReader(),
);
const transactionService = new TransactionApplicationService(
  transactionWriter,
  new PrismaTransactionQuery()
);
const googleGmailClient = new GoogleGmailClient(
  config.googleOAuthClientId,
  config.googleOAuthClientSecret,
  config.googleOAuthRedirectUri
);
const gmailTokenProvider = new GmailTokenProvider(googleGmailClient);
const gmailQueryService = new GmailQueryService();
const gmailLifecycleService = new GmailLifecycleService(
  googleGmailClient,
  new PrismaGmailConnectionReader(),
  {
    record: LegalService.recordGoogleConsent.bind(LegalService),
    revoke: LegalService.revokeGoogleConsent.bind(LegalService),
  }
);
const gmailMessageProcessor = new GmailMessageProcessor(googleGmailClient,
  new NormalizedEmailProcessor(transactionWriter));
const gmailSyncService = new GmailSyncService(googleGmailClient, gmailTokenProvider,
  gmailQueryService, gmailMessageProcessor);
const emailTransport = new EmailTransportService();
const syncCompletedNotifier = new SyncCompletedNotifier(
  emailTransport, new PrismaSyncCompletedContextReader(), config.appUrl,
);
const gmailJobHandlers = new GmailJobHandlerRegistry(gmailSyncService);
const ingestionControl = new RunnerLoopControl();
let ingestionJobService!: IngestionJobService;
const ingestionScheduler = new IngestionScheduler((input) => ingestionJobService.enqueue(input));
ingestionJobService = new IngestionJobService(gmailJobHandlers, ingestionScheduler,
  syncCompletedNotifier, () => ingestionControl.notifyWork());
const ingestionRunner = new IngestionRunner(ingestionJobService, runnerDelays, ingestionControl);
const gmailPushHandler = new HandleGmailPush(new GoogleOidcAdapter(),
  new PrismaInboxConnectionRepository(), ingestionJobService);
const inboxConnectionController = new InboxConnectionController(gmailLifecycleService,
  ingestionJobService, { replace: InstitutionSelectionService.replace.bind(InstitutionSelectionService) });
const proactiveRepository = new PrismaProactiveRepository();
const proactiveEngineService = new ProactiveEngineService(
  { radar: (wId, curr, win) => recurringService.radar(wId, curr, win) },
  { getMonthlyBudget: (wId, m, curr) => getMonthlyBudget.execute(wId, m, curr) },
  { getSafeToSpend: (wId, curr) => getSafeToSpend.execute(wId, curr) },
  proactiveRepository,
  proactiveRepository,
  proactiveRepository,
  proactiveRepository,
);
const emailRepository = new PrismaEmailRepository();
const weeklyEmailBuilder = new WeeklyEmailBuilder(
  { radar: (wId, curr, win) => recurringService.radar(wId, curr, win) },
  { getSafeToSpend: (wId, curr) => getSafeToSpend.execute(wId, curr) },
  proactiveRepository,
);
const proactiveEmailService = new ProactiveEmailService(emailRepository, emailTransport, weeklyEmailBuilder, {
  appUrl: config.appUrl, apiPublicUrl: config.apiPublicUrl, unsubscribeSecret: config.emailUnsubscribeSecret,
});
const betaInviteService = new BetaInviteService(
  new PrismaBetaInviteRepository(), emailRepository, proactiveEmailService, config.appUrl,
);
const proactiveEmailScheduler = new ProactiveEmailScheduler(
  emailRepository, { radar: (wId, curr, win) => recurringService.radar(wId, curr, win) },
  { getMonthlyBudget: (wId, month, curr) => getMonthlyBudget.execute(wId, month, curr) },
  { current: (wId, pId, curr, now) => paydayRitualService.current(wId, pId, curr, now) },
  weeklyEmailBuilder, proactiveEmailService, {
    weekly: config.emailWeeklyEnabled, imminentBill: config.emailImminentBillEnabled,
    priceHike: config.emailPriceHikeEnabled, pacingWarning: config.emailPacingWarningEnabled,
    paydayRitual: config.emailPaydayRitualEnabled,
  }, config.appUrl,
);
const proactiveEmailRunner = new ProactiveEmailRunner(proactiveEmailScheduler,
  proactiveEmailService, runnerDelays, new RunnerLoopControl());
const proactiveController = new ProactiveController(proactiveEngineService, proactiveEmailService);
const emailNotificationController = new EmailNotificationController(proactiveEmailService);

export const appContainer = {
  betaInviteService,
  proactiveController,
  proactiveEmailRunner,
  emailNotificationController,
  engagementController: new EngagementController(engagementService),
  paydayRitualController: new PaydayRitualController(paydayRitualService),
  recurringRunner,
  recurringController: new RecurringController(recurringService),
  ruleApplicationRunner,
  ruleApplicationController: new RuleApplicationController({
    preview: previewRuleApplication.execute.bind(previewRuleApplication),
    confirm: confirmRuleApplication.execute.bind(confirmRuleApplication),
    retry: retryRuleApplication.execute.bind(retryRuleApplication),
    get: ruleApplications.get.bind(ruleApplications), recent: ruleApplications.recent.bind(ruleApplications),
  }),
  budgetController,
  analyticsController: new AnalyticsController(analyticsService),
  categoryRuleController: new CategoryRuleController(categoryRuleService),
  transactionController: new TransactionHttpController(transactionService),
  financialReportController: new FinancialReportController(new FinancialReportService(analyticsService, transactionService, getMonthlyBudget)),
  readinessController: new ReadinessController(new PrismaReadinessRepository()),
  identityController: new IdentityController(new IdentityApplicationService(
    new PrismaProfileRepository(),
    { bootstrap: WorkspaceService.bootstrap.bind(WorkspaceService) },
    { hasCurrentRequired: LegalService.hasCurrentRequired.bind(LegalService) }
  )),
  gmailPubSubController: new GmailPubSubController(gmailPushHandler),
  inboxConnectionController,
  maintenanceController: new MaintenanceController(ingestionRunner, recurringRunner, proactiveEmailRunner, engagementService),
  gmailLifecycleService,
  gmailSyncService,
  ingestionJobService,
  ingestionRunner,
  accountController: new AccountController(new AccountService(gmailLifecycleService, budgetRepository, ruleRepository)),
  workspaceService: WorkspaceService,
  legalService: LegalService,
  legalController: new LegalController({
    current: LegalService.current.bind(LegalService),
    accept: LegalService.accept.bind(LegalService),
  }),
  bankConnectionController: new BankConnectionController(new FinancialInstitutionService()),
  incomeController,
  betaInterestController: new BetaInterestController(
    new BetaInterestService(new PrismaBetaInterestRepository()),
  ),
  syncCompletedNotifier,
};

