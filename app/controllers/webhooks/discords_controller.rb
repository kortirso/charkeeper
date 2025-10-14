# frozen_string_literal: true

module Webhooks
  class DiscordsController < ApplicationController
    include Deps[
      monitoring: 'monitoring.client'
    ]

    skip_before_action :verify_authenticity_token
    skip_before_action :authenticate
    before_action :validate_discord_signature

    def create
      monitoring_discord_webhook
      render json: { type: params[:type] == 1 ? 1 : 4 }, status: :ok
    end

    private

    def validate_discord_signature
      verify_key = RbNaCl::VerifyKey.new([public_key].pack('H*'))
      verify_key.verify([signature].pack('H*'), "#{timestamp}#{body}")
    rescue RbNaCl::BadSignatureError => _e
      head :unauthorized
    end

    def monitoring_discord_webhook
      monitoring.notify(
        exception: Monitoring::ReceiveDiscordWebhook.new('Discord webhook is received'),
        metadata: { params: params.permit!.to_h },
        severity: :info
      )
    end

    def public_key = Rails.application.credentials.dig(:production, :discord_public_key)
    def signature = request.headers['X-Signature-Ed25519']
    def timestamp = request.headers['X-Signature-Timestamp']
    def body = request.body.string
  end
end
