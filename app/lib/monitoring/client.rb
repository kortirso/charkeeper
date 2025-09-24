# frozen_string_literal: true

module Monitoring
  AuthByTelegram = Class.new(StandardError)
  AuthByUsername = Class.new(StandardError)
  ReceiveTelegramWebhook = Class.new(StandardError)
  HandleTelegramWebhook = Class.new(StandardError)
  SendingTelegramWebhook = Class.new(StandardError)
  ValidationError = Class.new(StandardError)
  FrontendError = Class.new(StandardError)
  FeatVariableError = Class.new(StandardError)

  class Client
    include Deps[provider: 'monitoring.providers.rails']

    def notify(exception:, metadata: {}, severity: nil)
      provider.notify(exception: exception, metadata: metadata, severity: severity)
    end
  end
end
