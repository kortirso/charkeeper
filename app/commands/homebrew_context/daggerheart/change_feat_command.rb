# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeFeatCommand < BaseCommand
      include Deps[refresh_bonuses: 'commands.bonuses_context.refresh']

      use_contract do
        config.messages.namespace = :homebrew_feat

        Kinds = Dry::Types['strict.string'].enum('static', 'text')
        Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'session')

        params do
          required(:feat).filled(type?: ::Daggerheart::Feat)
          optional(:title).filled(:string, max_size?: 50)
          optional(:description).filled(:string, max_size?: 500)
          optional(:kind).filled(Kinds)
          # optional(:level).filled(:integer, gteq?: 1)
          optional(:limit).filled(:integer, gteq?: 1)
          optional(:limit_refresh).filled(Limits)
          # optional(:subclass_mastery).filled(:integer)
          optional(:bonuses).maybe(:array).each(:hash) do
            required(:id).filled(type_included_in?: [Integer, String])
            required(:type).filled(:string)
            required(:value)
          end
          # optional(:no_refresh).filled(:bool)
        end

        rule(:limit, :limit_refresh).validate(:check_all_or_nothing_present)
      end

      private

      def do_prepare(input)
        input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
        input[:title] = { en: input[:title], ru: input[:title] }
        input[:description] = { en: input[:description], ru: input[:description] }
      end

      def do_persist(input)
        input[:feat].update!(input.except(:feat, :limit, :subclass_mastery, :level, :bonuses, :no_refresh))
        refresh_bonuses.call(bonusable: input[:feat], bonuses: input[:bonuses]) if input[:bonuses]

        { result: input[:feat] }
      end
    end
  end
end
