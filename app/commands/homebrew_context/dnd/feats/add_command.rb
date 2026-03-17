# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Feats
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :homebrew_feat

          Origins = Dry::Types['strict.string'].enum('subclass')
          Kinds = Dry::Types['strict.string'].enum('static', 'text')
          Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'one_at_short_rest')

          params do
            required(:user).filled(type?: ::User)
            required(:title).filled(:string, max_size?: 50)
            required(:description).filled(:string, max_size?: 500)
            required(:origin).filled(Origins)
            required(:origin_value).filled(:string)
            required(:kind).filled(Kinds)
            required(:level).filled(:integer, gteq?: 1)
            optional(:limit).filled(:integer, gteq?: 1)
            optional(:limit_refresh).filled(Limits)
          end

          rule(:limit, :limit_refresh).validate(:check_all_or_nothing_present)
          rule(:origin, :origin_value, :user) do
            origin =
              case values[:origin]
              when 'subclass'
                ::Dnd2024::Homebrew::Subclass.find_by(user_id: values[:user].id, id: values[:origin_value])
              end
            next if origin

            key(:origin).failure(:not_found)
          end
        end

        private

        def do_prepare(input)
          input[:origin_value] = sanitize(input[:origin_value])
          input[:conditions] = { level: input[:level] }
          input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
          input[:title] = { en: sanitize(input[:title]) }
          input[:description] = { en: sanitize(input[:description]) }
        end

        def do_persist(input)
          result = ::Dnd2024::Feat.create!(input.except(:limit, :level))

          { result: result }
        end
      end
    end
  end
end
