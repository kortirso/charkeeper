# frozen_string_literal: true

module Owlbear
  class CampaignsController < Owlbear::BaseController
    before_action :find_campaign

    def show
      @campaign.channels.find_or_create_by(provider: ::Channel::OWLBEAR)
    end

    private

    def find_campaign
      @campaign = ::Campaign.find(params[:id])
    end
  end
end
