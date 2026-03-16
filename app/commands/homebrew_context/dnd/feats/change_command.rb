# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Feats
      class ChangeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :homebrew_feat

          Kinds = Dry::Types['strict.string'].enum('static', 'text')
          Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'one_at_short_rest')

          params do
            required(:feat).filled(type?: ::Dnd2024::Feat)
            optional(:title).filled(:string, max_size?: 50)
            optional(:description).filled(:string, max_size?: 500)
            optional(:kind).filled(Kinds)
            optional(:level).filled(:integer, gteq?: 1)
            optional(:limit).filled(:integer, gteq?: 1)
            optional(:limit_refresh).filled(Limits)
          end

          rule(:limit, :limit_refresh).validate(:check_all_or_nothing_present)
        end

        private

        def do_prepare(input)
          input[:conditions] = { level: input[:level] } if input.key?(:level)
          input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
          input[:title] = { en: sanitize(input[:title]) } if input.key?(:title)
          input[:description] = { en: sanitize(input[:description]) } if input.key?(:description)
        end

        def do_persist(input)
          input[:feat].update!(input.except(:feat, :limit, :level))

          { result: input[:feat] }
        end
      end
    end
  end
end
