# frozen_string_literal: true

module Webhooks
  class TelegramsController < ApplicationController
    include Deps[monitoring: 'monitoring.client']

    skip_before_action :verify_authenticity_token
    skip_before_action :authenticate

    def create
      monitoring_telegram_webhook
      head :ok
    end

    private

    def monitoring_telegram_webhook
      monitoring.notify(
        exception: 'Telegram webhook',
        metadata: {
          params: params.permit!.to_h
        },
        severity: :info
      )
    end
  end
end
