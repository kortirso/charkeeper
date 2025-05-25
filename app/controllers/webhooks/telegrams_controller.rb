# frozen_string_literal: true

module Webhooks
  class TelegramsController < ApplicationController
    include Deps[
      monitoring: 'monitoring.client',
      webhook_handler: 'services.telegram_webhooks.handler'
    ]
    include Schemable

    skip_before_action :verify_authenticity_token
    skip_before_action :authenticate

    def create
      monitoring_telegram_webhook
      webhook_handler.call(message: create_params[:message])
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

    def create_params
      validate_params_with_schema(params: params, schema: schema)
    end

    def schema
      Dry::Schema.Params do
        required(:message).hash do
          required(:from).hash do
            required(:first_name).filled(:string)
            required(:last_name).filled(:string)
            required(:username).filled(:string)
            required(:language_code).filled(:string)
          end
          required(:chat).hash do
            required(:id).filled
          end
          required(:text).filled(:string)
        end
      end
    end
  end
end
