# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddItemCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_item

        Kinds = Dry::Types['strict.string'].enum('item', 'consumable', 'primary weapon', 'secondary weapon', 'armor')

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
          required(:kind).filled(Kinds)
          optional(:info).hash
        end
      end

      private

      def do_prepare(input)
        input[:name] = { en: input[:name], ru: input[:name] }
      end

      def do_persist(input)
        result = ::Daggerheart::Item.create!(input)

        { result: result }
      end
    end
  end
end
