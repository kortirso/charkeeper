# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class AddSpellCommand < BaseCommand
      use_contract do
        config.messages.namespace = :daggerheart_character

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          required(:spell).filled(type?: ::Daggerheart::Spell)
        end

        rule(:character, :spell) do
          next if values[:spell].data.domain.in?(values[:character].selected_domains)

          key(:spell).failure(:invalid_domain_card)
        end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Character::Spell.create!(
          character: input[:character],
          spell: input[:spell],
          data: { ready_to_use: false }
        )

        { result: result }
      end
    end
  end
end
