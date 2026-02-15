# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddSubclassCommand < BaseCommand
      include Deps[cache: 'cache.daggerheart_names']

      use_contract do
        config.messages.namespace = :homebrew_subclass

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
          required(:class_name).filled(:string)
          required(:spellcast).maybe(:string)
          optional(:mechanics).maybe(:array).each(:string)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_prepare(input)
        input[:attributes] = input.slice(:user, :name, :class_name, :public)
        input[:data] = { data: input.slice(:spellcast, :mechanics) }
      end

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Subclass.create!(input[:attributes].merge(input[:data]))

        cache.push_item(key: :subclasses, item: result)

        { result: result }
      end
    end
  end
end
