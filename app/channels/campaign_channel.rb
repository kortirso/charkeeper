# frozen_string_literal: true

class CampaignChannel < ApplicationCable::Channel
  after_subscribe :send_welcome_message

  def subscribed
    @campaign = Campaign.find(params[:campaign_id])
    stream_for @campaign
  end

  private

  def send_welcome_message
    broadcast_to(@campaign, { message: 'Приветствуем в канале' }) if @campaign
  end
end
