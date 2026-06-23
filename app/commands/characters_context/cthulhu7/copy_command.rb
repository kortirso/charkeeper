# frozen_string_literal: true

module CharactersContext
  module Cthulhu7
    class CopyCommand < BaseCommand
      use_contract do
        config.messages.namespace = :cthulhu7_character

        params do
          required(:character).filled(type?: ::Cthulhu7::Character)
        end
      end

      private

      def do_prepare(input)
        input[:copy] = input[:character].dup.tap do |new_record|
          new_record.name = "#{input[:character].name} #{SecureRandom.alphanumeric(4)}"
        end
      end

      def do_persist(input)
        input[:copy].save

        items = input[:character].items.map do |item|
          item.attributes.slice('data', 'item_id', 'states', 'notes').symbolize_keys.merge(character_id: input[:copy].id)
        end
        Character::Item.upsert_all(items) if items.any?

        { result: input[:copy] }
      end
    end
  end
end
