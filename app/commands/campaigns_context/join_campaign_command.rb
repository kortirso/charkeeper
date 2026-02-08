# frozen_string_literal: true

module CampaignsContext
  class JoinCampaignCommand < BaseCommand
    CHARACTER_PROVIDERS = {
      'Dnd5::Character' => 'dnd5',
      'Dnd2024::Character' => 'dnd2024',
      'Daggerheart::Character' => 'daggerheart',
      'Pathfinder2::Character' => 'pathfinder2',
      'Dc20::Character' => 'dc20',
      'Fate::Character' => 'fate'
    }.freeze

    use_contract do
      config.messages.namespace = :campaign_character

      params do
        required(:campaign).filled(type?: Campaign)
        required(:character).filled(type?: Character)
      end
    end

    private

    def validate_content(input)
      return if CHARACTER_PROVIDERS[input[:character].class.name] == input[:campaign].provider

      [I18n.t('commands.campaigns_context.join_campaign.provider_mismatch')]
    end

    def do_persist(input)
      result = Campaign::Character.create!(input)

      { result: result }
    rescue ActiveRecord::RecordNotUnique => _e
      { errors: { campaign_character: ['Already exists'] }, errors_list: ['Already exists'] }
    end
  end
end
