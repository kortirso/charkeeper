# frozen_string_literal: true

module CampaignsContext
  class AddCampaignCommand < BaseCommand
    use_contract do
      config.messages.namespace = :campaign

      Providers = Dry::Types['strict.string'].enum('dnd5', 'dnd2024', 'daggerheart', 'pathfinder2')

      params do
        required(:user).filled(type?: User)
        required(:name).filled(:string, max_size?: 50)
        required(:provider).filled(Providers)
      end
    end

    private

    def do_persist(input)
      result = Campaign.create!(input)

      { result: result }
    end
  end
end
