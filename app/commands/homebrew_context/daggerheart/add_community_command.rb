# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddCommunityCommand < BaseCommand
      include Deps[cache: 'cache.daggerheart_names']

      use_contract do
        config.messages.namespace = :homebrew_community

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Community.create!(input)

        cache.push_item(key: :communities, item: result)

        { result: result }
      end
    end
  end
end
