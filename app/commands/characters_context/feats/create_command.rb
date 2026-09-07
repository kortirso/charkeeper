# frozen_string_literal: true

module CharactersContext
  module Feats
    class CreateCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Character)
          required(:title).hash do
            required(:en).filled(:string, max_size?: 50)
          end
          required(:description).hash do
            required(:en).filled(:string, max_size?: 1_000)
          end
        end
      end

      private

      def do_prepare(input)
        input[:title].transform_values! { |value| sanitize(value) }
        input[:description].transform_values! { |value| sanitize(value) }
        input[:user] = input[:character].user
        input[:origin] = 'character'
        input[:origin_value] = input[:character].id
        input[:kind] = 'static'
        input[:continious] = false
      end

      def do_persist(input)
        class_name = input[:character].type.split(':').first
        result = "#{class_name}::Feat".constantize.create!(input.except(:character))
        ::Character::Feat.create(character: input[:character], feat: result, ready_to_use: true)

        { result: result }
      end
    end
  end
end
