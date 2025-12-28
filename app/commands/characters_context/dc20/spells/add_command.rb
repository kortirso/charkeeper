# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Spells
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :dc20_character

          params do
            required(:character).filled(type?: ::Dc20::Character)
            required(:spell).filled(type?: ::Dc20::Feat)
          end
        end

        private

        def do_prepare(input)
          input[:existing_spell] = ::Dc20::Character::Feat.find_by(character_id: input[:character].id, feat_id: input[:spell].id)
          input[:feat] = input[:spell]
        end

        def do_persist(input)
          return { result: input[:existing_spell] } if input[:existing_spell]

          result = ::Dc20::Character::Feat.create!(input.slice(:character, :feat))

          { result: result }
        end
      end
    end
  end
end
