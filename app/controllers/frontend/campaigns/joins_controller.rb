# frozen_string_literal: true

module Frontend
  module Campaigns
    class JoinsController < Frontend::BaseController
      include Deps[join_service: 'commands.campaigns_context.join_campaign']
      include SerializeResource

      before_action :find_campaign, only: %i[show create destroy]
      before_action :find_character, only: %i[create]
      before_action :find_campaign_character, only: %i[destroy]

      def show
        serialize_resource(@campaign, ::CampaignSerializer, :campaign, { except: %i[characters] }, :ok)
      end

      def create
        case join_service.call({ campaign: @campaign, character: @character })
        in { errors: errors } then unprocessable_response(errors)
        else only_head_response
        end
      end

      def destroy
        authorize! @campaign, to: :destroy?
        @campaign_character.destroy
        only_head_response
      end

      private

      def find_campaign
        @campaign = Campaign.find(params[:campaign_id])
      end

      def find_character
        @character = current_user.characters.send(@campaign.provider).find(params[:character_id])
      end

      def find_campaign_character
        @campaign_character = @campaign.campaign_characters.find(params[:character_id])
      end
    end
  end
end
