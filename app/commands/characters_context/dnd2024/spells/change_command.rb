# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    module Spells
      class ChangeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :dnd5_character

          params do
            required(:character_spell).filled(type?: ::Dnd2024::Character::Feat)
            optional(:ready_to_use).filled(:bool)
            optional(:notes).maybe(:string, max_size?: 100)
          end
        end

        private

        def do_persist(input)
          input[:character_spell].update!(input.slice(:ready_to_use, :notes))

          { result: input[:character_spell] }
        end
      end
    end
  end
end
