# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeItemCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_item

        params do
          required(:item).filled(type?: ::Daggerheart::Item)
          optional(:name).filled(:string, max_size?: 50)
          optional(:description).maybe(:string, max_size?: 250)
          optional(:info).hash
        end
      end

      private

      def do_prepare(input)
        input[:name] = { en: input[:name], ru: input[:name] }
        input[:description] = { en: input[:description], ru: input[:description] }
      end

      def do_persist(input)
        input[:item].update!(input.except(:item))

        { result: input[:item] }
      end
    end
  end
end
