# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Backgrounds
      class ChangeCommand < BaseCommand
        include Deps[cache: 'cache.dnd_names']

        use_contract do
          config.messages.namespace = :homebrew_community

          params do
            required(:background).filled(type?: ::Dnd2024::Homebrew::Background)
            optional(:name).filled(:string, max_size?: 50)
            optional(:public).filled(:bool)
            optional(:data).hash do
              required(:selected_feats).filled(:array).each(:string)
              required(:selected_skills).hash
              required(:ability_boosts).filled(:array).each(:string)
            end
          end
        end

        private

        def do_persist(input)
          input[:background].update!(input.slice(:name, :public, :data))

          cache.push_item(key: :backgrounds, item: input[:background])

          { result: input[:background] }
        end
      end
    end
  end
end
