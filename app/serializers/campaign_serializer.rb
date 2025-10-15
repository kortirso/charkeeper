# frozen_string_literal: true

class CampaignSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id name provider characters].freeze

  attributes(*ATTRIBUTES)

  def characters
    object.campaign_characters.includes(:character).map do |member|
      {
        id: member.id,
        character_id: member.character.id,
        name: member.character.name
      }
    end
  end
end
