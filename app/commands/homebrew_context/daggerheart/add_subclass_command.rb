# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddSubclassCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_subclass

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
          required(:class_name).filled(:string)
          required(:spellcast).maybe(:string)
        end
      end

      private

      def do_prepare(input)
        input[:attributes] = input.slice(:user, :name, :class_name)
        input[:data] = { data: input.slice(:spellcast) }
      end

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Subclass.create!(input[:attributes].merge(input[:data]))

        { result: result }
      end
    end
  end
end
