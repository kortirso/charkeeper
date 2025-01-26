# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class SpellAddCommand < BaseCommand
      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type?: ::Dnd5::Character)
          required(:spell).filled(type?: ::Dnd5::Spell)
          required(:target_spell_class).filled(:string)
        end

        rule(:character, :target_spell_class) do
          key(:character).failure(:can_not_learn) unless values[:character].can_learn_spell?(values[:target_spell_class])
        end

        rule(:spell, :target_spell_class) do
          key(:spell).failure(:can_not_learn) unless values[:spell].available_for.include?(values[:target_spell_class])
        end
      end

      private

      def do_persist(input)
        ::Dnd5::Character::Spell.create(
          character: input[:character],
          spell: input[:spell],
          prepared_by: input[:target_spell_class],
          ready_to_use: input[:target_spell_class] != ::Dnd5::Character::WIZARD
        )

        { result: input[:character].reload }
      end
    end
  end
end
