# frozen_string_literal: true

module Frontend
  class CampaignsController < Frontend::BaseController
    include Deps[add_service: 'commands.campaigns_context.add_campaign']
    include SerializeRelation
    include SerializeResource

    before_action :find_campaign, only: %i[show destroy]

    def index
      serialize_relation(campaigns, ::CampaignSerializer, :campaigns)
    end

    def show
      serialize_resource(@campaign, ::CampaignSerializer, :campaign, {}, :ok)
    end

    def create
      case add_service.call(create_params.merge(user: current_user))
      in { errors: errors } then unprocessable_response(errors)
      in { result: result } then serialize_resource(result, ::CampaignSerializer, :campaign, {}, :created)
      end
    end

    def destroy
      authorize! @campaign, to: :destroy?
      @campaign.destroy
      only_head_response
    end

    private

    def find_campaign
      @campaign = campaigns.find(params[:id])
    end

    def create_params
      params.require(:campaign).permit!.to_h
    end

    def campaigns
      Campaign.where(user_id: current_user.id)
        .or(
          Campaign.where(id: Campaign::Character.where(character_id: current_user.characters.select(:id)).select(:campaign_id))
        )
    end
  end
end
