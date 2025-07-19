# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class MakeShortRestCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Dnd2024::Character)
        end
      end

      private

      def do_persist(input)
        input[:character].feats.where(limit_refresh: 0).update_all(used_count: 0)
        input[:character].feats.where(limit_refresh: 2).where.not(used_count: 0).find_each { |item| item.decrement!(:used_count) }

        { result: :ok }
      end
    end
  end
end
