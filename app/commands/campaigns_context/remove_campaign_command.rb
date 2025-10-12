# frozen_string_literal: true

module CampaignsContext
  class RemoveCampaignCommand < BaseCommand
    use_contract do
      config.messages.namespace = :campaign

      params do
        required(:user).filled(type?: ::User)
        required(:name).filled(:string, max_size?: 50)
      end
    end

    private

    def do_prepare(input)
      input[:campaign] = input[:user].campaigns.find_by!(name: input[:name])
    end

    def do_persist(input)
      input[:campaign].destroy

      { result: :ok }
    end
  end
end
