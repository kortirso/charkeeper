# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Spells
      class ChangeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :pathfinder2_character

          params do
            required(:character_spell).filled(type?: ::Pathfinder2::Character::Feat)
            optional(:ready_to_use).filled(:bool)
            optional(:selected_count).filled(:integer)
            optional(:used_count).filled(:integer)
            optional(:notes).maybe(:string, max_size?: 100)
          end
        end

        private

        def do_persist(input)
          input[:character_spell].update!(input.except(:character_spell))

          { result: input[:character_spell] }
        end
      end
    end
  end
end
