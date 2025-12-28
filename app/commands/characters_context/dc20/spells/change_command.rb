# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Spells
      class ChangeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :dc20_character

          params do
            required(:character_spell).filled(type?: ::Dc20::Character::Feat)
            optional(:notes).maybe(:string, max_size?: 250)
          end
        end

        private

        def do_persist(input)
          input[:character_spell].update!(input.slice(:notes))

          { result: input[:character_spell] }
        end
      end
    end
  end
end
