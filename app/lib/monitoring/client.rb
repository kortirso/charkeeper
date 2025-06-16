# frozen_string_literal: true

module Monitoring
  AuthByTelegram = Class.new(StandardError)
  ReceiveTelegramWebhook = Class.new(StandardError)

  class Client
    include Deps[provider: 'monitoring.providers.rails']

    def notify(exception:, metadata: {}, severity: nil)
      provider.notify(exception: exception, metadata: metadata, severity: severity)
    end
  end
end
