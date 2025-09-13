# frozen_string_literal: true

module CampaignsContext
  class JoinCampaignCommand < BaseCommand
    use_contract do
      config.messages.namespace = :campaign_character

      params do
        required(:campaign).filled(type?: Campaign)
        required(:character).filled(type?: Character)
      end
    end

    private

    def do_persist(input)
      result = Campaign::Character.create!(input)

      { result: result }
    rescue ActiveRecord::RecordNotUnique => _e
      { errors: { campaign_character: ['Already exists'] }, errors_list: ['Already exists'] }
    end
  end
end
