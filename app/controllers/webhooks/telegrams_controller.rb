# frozen_string_literal: true

module Webhooks
  class TelegramsController < ApplicationController
    include Deps[monitoring: 'monitoring.client']

    skip_before_action :verify_authenticity_token
    skip_before_action :authenticate
    before_action :check_telegram_bot_secret

    def create
      monitoring_telegram_webhook

      if params[:message]
        WebhooksContext::Telegram::ReceiveMessageJob.perform_later(message: params[:message].to_h.deep_symbolize_keys)
      end
      if params[:my_chat_member]
        WebhooksContext::Telegram::ReceiveChatMemberJob.perform_later(message: params[:my_chat_member].to_h.deep_symbolize_keys)
      end

      head :ok
    end

    private

    def check_telegram_bot_secret
      return if request.headers['X-Telegram-Bot-Api-Secret-Token'] == web_telegram_bot_secret

      head :ok
    end

    def web_telegram_bot_secret
      Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_secret)
    end

    def monitoring_telegram_webhook
      monitoring.notify(
        exception: Monitoring::ReceiveTelegramWebhook.new('Telegram webhook is received'),
        metadata: { params: params.permit!.to_h },
        severity: :info
      )
    end
  end
end
