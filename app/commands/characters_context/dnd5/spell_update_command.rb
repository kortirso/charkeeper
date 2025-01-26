# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class SpellUpdateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type?: ::Dnd5::Character)
          required(:character_spell).filled(type?: ::Dnd5::Character::Spell)
          optional(:ready_to_use).filled(:bool)
        end

        rule(:character, :character_spell, :ready_to_use) do
          next if values[:ready_to_use].nil?
          next if values[:character].can_prepare_spell?(values[:character_spell].prepared_by)

          key(:character).failure(:can_not_prepare)
        end
      end

      private

      def do_persist(input)
        input[:character_spell].update!(input.except(:character, :character_spell))

        { result: input[:character_spell].reload }
      end
    end
  end
end
