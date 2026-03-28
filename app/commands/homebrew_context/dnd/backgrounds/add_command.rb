# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Backgrounds
      class AddCommand < BaseCommand
        include Deps[cache: 'cache.dnd_names']

        use_contract do
          config.messages.namespace = :homebrew_community

          params do
            required(:user).filled(type?: ::User)
            required(:name).filled(:string, max_size?: 50)
            required(:data).hash do
              required(:selected_feats).filled(:array).each(:string)
              required(:selected_skills).hash
              required(:ability_boosts).filled(:array).each(:string)
            end
            optional(:public).filled(:bool)
          end
        end

        private

        def do_persist(input)
          result = ::Dnd2024::Homebrew::Background.create!(input)

          cache.push_item(key: :backgrounds, item: result)

          { result: result }
        end
      end
    end
  end
end
