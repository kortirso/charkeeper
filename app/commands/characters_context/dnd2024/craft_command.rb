# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class CraftCommand < BaseCommand
      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type?: ::Dnd2024::Character)
          required(:item).filled(type?: ::Dnd5::Item)
          required(:amount).filled(:integer, gt?: 0)
          required(:price).filled(:integer, gteq?: 0)
        end
      end

      private

      def validate_content(input)
        return if input[:character].data.money >= input[:price]

        [I18n.t('commands.characters_context.dnd2024.craft.no_money')]
      end

      def do_prepare(input)
        input[:character_item] = ::Character::Item.find_or_create_by(input.slice(:character, :item))
      end

      def do_persist(input)
        input[:character_item].increment!(:quantity, input[:amount])
        input[:character].data =
          input[:character].data.attributes.merge({ 'money' => input[:character].data.money - input[:price] })
        input[:character].save

        { result: :ok }
      end
    end
  end
end
