# frozen_string_literal: true

module Web
  module Campaigns
    class JoinsController < Web::BaseController
      layout 'charkeeper_app'

      before_action :find_campaign, only: %i[show]

      def show
        @access_token = cookies[Authkeeper.configuration.access_token_name]
      end

      private

      def find_campaign
        @campaign = Campaign.find(params[:campaign_id])
      end
    end
  end
end
