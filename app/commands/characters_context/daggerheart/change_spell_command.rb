# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class ChangeSpellCommand < BaseCommand
      use_contract do
        config.messages.namespace = :daggerheart_character

        params do
          required(:character_spell).filled(type?: ::Daggerheart::Character::Feat)
          optional(:active).filled(:bool)
          optional(:ready_to_use).filled(:bool)
          optional(:notes).maybe(:string, max_size?: 250)
        end
      end

      private

      def do_persist(input)
        input[:character_spell].update!(input.slice(:notes, :active, :ready_to_use))

        { result: input[:character_spell] }
      end
    end
  end
end
