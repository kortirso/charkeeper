# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    module Transformations
      class CopyCommand < BaseCommand
        include Deps[
          add_transformation: 'commands.homebrew_context.daggerheart.transformations.add',
          copy_feats: 'commands.homebrew_context.daggerheart.copy_feats'
        ]

        use_contract do
          params do
            required(:transformation).filled(type?: ::Daggerheart::Homebrew::Transformation)
            required(:user).filled(type?: ::User)
          end
        end

        private

        def do_persist(input)
          result = ActiveRecord::Base.transaction do
            transformation = add_transformation.call({ user: input[:user], name: input[:transformation].name })[:result]

            copy_feats.call(
              feats: input[:transformation].user.feats.where(origin: 6, origin_value: input[:transformation].id).to_a,
              user: input[:user],
              origin_value: transformation.id
            )

            community
          end

          { result: result }
        end
      end
    end
  end
end
