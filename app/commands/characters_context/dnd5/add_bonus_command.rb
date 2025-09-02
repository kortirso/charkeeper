# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class AddBonusCommand < BaseCommand
      use_contract do
        config.messages.namespace = :character_bonus

        params do
          required(:character).filled(type_included_in?: [::Dnd5::Character, ::Dnd2024::Character])
          required(:comment).filled(:string)
          required(:value).hash do
            optional(:abilities).hash do
              optional(:str).filled(:integer)
              optional(:dex).filled(:integer)
              optional(:con).filled(:integer)
              optional(:wis).filled(:integer)
              optional(:int).filled(:integer)
              optional(:cha).filled(:integer)
            end
            optional(:health).filled(:integer)
            optional(:initiative).filled(:integer)
            optional(:armor_class).filled(:integer)
            optional(:attack).filled(:integer)
            optional(:speed).filled(:integer)
          end
        end
      end

      private

      def do_persist(input)
        result = ::Character::Bonus.create!(input)

        { result: result }
      end
    end
  end
end
