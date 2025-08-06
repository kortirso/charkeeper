# frozen_string_literal: true

module Frontend
  class CampaignsController < Frontend::BaseController
    include SerializeRelation

    def index
      serialize_relation(campaigns, ::CampaignSerializer, :campaigns)
    end

    private

    def campaigns
      Campaign.where(user_id: current_user.id)
        .or(
          Campaign.where(id: Campaign::Character.where(character_id: current_user.characters.select(:id)).select(:campaign_id))
        )
    end
  end
end
