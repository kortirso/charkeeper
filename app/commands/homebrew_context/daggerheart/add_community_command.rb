# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddCommunityCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_community

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
        end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Community.create!(input)

        { result: result }
      end
    end
  end
end
