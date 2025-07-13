# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class AddCompanionCommand < BaseCommand
      use_contract do
        config.messages.namespace = :character_companion

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          required(:name).filled(:string)
        end

        rule(:character) do
          next if value.data.subclasses.value?('beastbound')

          key.failure(:must_be_beastbound)
        end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Character::Companion.create!(input)

        { result: result }
      end
    end
  end
end
