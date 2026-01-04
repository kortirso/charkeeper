# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class RecipesController < Homebrews::BaseController
      include Deps[
        add_recipe: 'commands.homebrew_context.daggerheart.recipes.add',
        copy_recipe: 'commands.homebrew_context.daggerheart.recipes.copy'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_recipes, only: %i[index]
      before_action :find_recipe, only: %i[destroy]
      before_action :find_another_recipe, only: %i[copy]

      def index
        serialize_relation(
          @recipes,
          ::Homebrews::Daggerheart::RecipeSerializer,
          :recipes,
          {},
          { current_user_id: current_user.id }
        )
      end

      def create
        case add_recipe.call(recipe_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::Homebrews::Daggerheart::RecipeSerializer, :recipe, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      def destroy
        @recipe.destroy
        only_head_response
      end

      def copy
        case copy_recipe.call({ recipe: @recipe, user: current_user })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::RecipeSerializer, :recipe, {}, :created)
        end
      end

      private

      def find_recipes
        @recipes =
          ::Item::Recipe.where(user_id: current_user.id)
            .or(::Item::Recipe.where.not(user_id: current_user.id).where(public: true))
            .order(created_at: :desc)
      end

      def find_recipe
        @recipe = ::Item::Recipe.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_another_recipe
        @recipe = ::Item::Recipe.where.not(user_id: current_user.id).find(params[:id])
      end

      def recipe_params
        params.require(:recipe).permit!.to_h
      end
    end
  end
end
