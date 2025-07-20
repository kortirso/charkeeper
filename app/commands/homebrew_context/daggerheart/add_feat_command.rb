# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddFeatCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_feat

        Origins = Dry::Types['strict.string'].enum('ancestry', 'class')
        Kinds = Dry::Types['strict.string'].enum('static', 'text')
        Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'session')

        params do
          required(:user).filled(type?: ::User)
          required(:title).filled(:string, max_size?: 50)
          required(:description).filled(:string, max_size?: 250)
          required(:origin).filled(Origins)
          required(:origin_value).filled(:string, :uuid_v4?)
          required(:kind).filled(Kinds)
          optional(:limit).filled(:integer, gteq?: 1)
          optional(:limit_refresh).filled(Limits)
        end

        rule(:limit, :limit_refresh).validate(:check_all_or_nothing_present)
        rule(:origin, :origin_value, :user) do
          origin =
            case values[:origin]
            when 'ancestry' then ::Daggerheart::Homebrew::Race.find_by(user_id: values[:user].id, id: values[:origin_value])
            when 'class' then ::Daggerheart::Homebrew::Speciality.find_by(user_id: values[:user].id, id: values[:origin_value])
            end
          next if origin

          key(:origin).failure(:not_found)
        end
      end

      private

      def do_prepare(input)
        input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
        input[:title] = { en: input[:title], ru: input[:title] }
        input[:description] = { en: input[:description], ru: input[:description] }
      end

      def do_persist(input)
        result = ::Daggerheart::Feat.create!(input.except(:limit))

        { result: result }
      end
    end
  end
end
