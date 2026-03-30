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
          end
        end

        private

        def do_persist(input)
          result = ::Pathfinder2::Character::Feat.create!(
            character: input[:character],
            feat: input[:feat],
            ready_to_use: ::Pathfinder2::Character::SPONTANEOUS_CASTERS.include?(input[:character].data.main_class),
            selected_count: 0,
            used_count: 0
          )

          { result: result }
        end
      end
    end
  end
end
