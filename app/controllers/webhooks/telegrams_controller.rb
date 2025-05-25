# frozen_string_literal: true

module Webhooks
  class TelegramsController < ApplicationController
    include Deps[
      monitoring: 'monitoring.client',
      receive_telegram_webhook: 'commands.webhooks_context.receive_telegram_webhook'
    ]

    skip_before_action :verify_authenticity_token
    skip_before_action :authenticate

    def create
      monitoring_telegram_webhook
      receive_telegram_webhook.call({ message: params[:message].to_h.deep_symbolize_keys }) if params[:message]
      head :ok
    end

    private

    def monitoring_telegram_webhook
      monitoring.notify(
        exception: Monitoring::ReceiveTelegramWebhook.new('Telegram webhook is received'),
        metadata: { params: params.permit!.to_h },
        severity: :info
      )
    end
  end
end
