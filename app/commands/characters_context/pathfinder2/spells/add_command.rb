# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Spells
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :pathfinder2_character

          params do
            required(:character).filled(type?: ::Pathfinder2::Character)
            required(:feat).filled(type?: ::Pathfinder2::Feat)
            optional(:level).filled(:integer)
            optional(:innate).filled(:bool)
            optional(:focus).filled(:bool)
            optional(:additional).filled(:bool)
          end
        end

        private

        def do_prepare(input)
          input[:value] = {}
          input[:value] = { 'innate' => input[:innate] } if input.key?(:innate)
          input[:value] = { 'focus' => input[:focus] } if input.key?(:focus)
          input[:value][:additional] = true if input[:additional]
        end

        def do_persist(input)
          spontaneous_caster = ::Pathfinder2::Character::SPONTANEOUS_CASTERS.include?(input[:character].data.main_class)

          result = ::Pathfinder2::Character::Feat.create!(
            character: input[:character],
            feat: input[:feat],
            ready_to_use: spontaneous_caster,
            value: spontaneous_caster ? input[:value].merge({ input[:level].to_s => { 'selected_count' => 1 } }) : input[:value]
          )

          { result: result }
        end
      end
    end
  end
end
