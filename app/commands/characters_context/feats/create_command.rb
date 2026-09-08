# frozen_string_literal: true

module CharactersContext
  module Feats
    class CreateCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Character)
          required(:title).filled(:string, max_size?: 50)
          required(:description).filled(:string, max_size?: 1_000)
        end
      end

      private

      def do_prepare(input)
        input[:title] = { en: sanitize(input[:title]) }
        input[:description] = { en: sanitize(input[:description]) }
        input[:user] = input[:character].user
        input[:origin] = 'character'
        input[:origin_value] = input[:character].id
        input[:kind] = 'static'
        input[:continious] = false
      end

      def do_persist(input)
        class_name = input[:character].type.split(':').first
        feat = "#{class_name}::Feat".constantize.create!(input.except(:character))
        result = ::Character::Feat.create(character: input[:character], feat: feat, ready_to_use: true)

        { result: result }
      end
    end
  end
end
