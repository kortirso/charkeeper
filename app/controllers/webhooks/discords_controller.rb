# frozen_string_literal: true

module Webhooks
  class DiscordsController < ApplicationController
    include Deps[
      monitoring: 'monitoring.client'
    ]

    skip_before_action :verify_authenticity_token
    skip_before_action :authenticate

    def create
      monitoring_discord_webhook
      head :no_content
    end

    private

    def monitoring_discord_webhook
      monitoring.notify(
        exception: Monitoring::ReceiveDiscordWebhook.new('Discord webhook is received'),
        metadata: { params: params.permit!.to_h },
        severity: :info
      )
    end
  end
end
