# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class MakeShortRestCommand < CharactersContext::Dnd5::MakeShortRestCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Dnd2024::Character)
          optional(:options).hash do
            required(:d6).filled(:integer, gteq?: 0)
            required(:d8).filled(:integer, gteq?: 0)
            required(:d10).filled(:integer, gteq?: 0)
            required(:d12).filled(:integer, gteq?: 0)
          end
          optional(:make_rolls).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:character].feats.where(limit_refresh: 0).update_all(used_count: 0)
        input[:character].feats.where(limit_refresh: 2).where.not(used_count: 0).find_each { |item| item.decrement!(:used_count) }
        update_character(input)

        { result: :ok }
      end
    end
  end
end
