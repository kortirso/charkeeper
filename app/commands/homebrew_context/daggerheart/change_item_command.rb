# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeItemCommand < BaseCommand
      include Deps[
        refresh_bonuses: 'commands.bonuses_context.refresh',
        convert_item: 'commands.homebrew_context.daggerheart.convert_item'
      ]

      use_contract do
        config.messages.namespace = :homebrew_item

        Kinds = Dry::Types['strict.string'].enum('primary weapon', 'secondary weapon', 'armor')

        params do
          required(:item).filled(type?: ::Daggerheart::Item)
          optional(:name).filled(:string, max_size?: 50)
          optional(:description).maybe(:string, max_size?: 250)
          optional(:info).hash
          optional(:public).filled(:bool)
          optional(:bonuses).maybe(:array).each(:hash) do
            required(:id).filled(type_included_in?: [Integer, String])
            optional(:type).filled(:string)
            optional(:value)
          end
          optional(:convert).maybe(Kinds)
        end
      end

      private

      def do_prepare(input)
        input[:name] = { en: input[:name], ru: input[:name] }
        input[:description] = { en: input[:description], ru: input[:description] }
      end

      def do_persist(input)
        input[:item].update!(input.except(:item, :bonuses, :convert))

        refresh_bonuses.call(bonusable: input[:item], bonuses: input[:bonuses]) if input[:bonuses]
        convert_item.call(item: input[:item], kind: input[:convert]) if input.key?(:convert)

        { result: input[:item] }
      end
    end
  end
end
