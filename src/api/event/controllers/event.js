const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::event.event", ({ strapi }) => ({
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.entityService.findMany("api::event.event", {
      fields: "*",
      filters: { user: user.id },
      populate: "*",
    });

    if (!data) {
      return ctx.notFound();
    }

    const sanitizedEntity = await this.sanitizeOutput(data, ctx);
    return sanitizedEntity;
  },
  // Create event with linked user
  async create(ctx) {
    const user = ctx.state.user;
    const response = await super.create(ctx);
    const updateResponse = await strapi.entityService.update(
      "api::event.event",
      response.data.id,
      { data: { user: user.id } }
    );
    const sanitizedEntity = await this.sanitizeOutput(updateResponse, ctx);
    const transformed = this.transformResponse(sanitizedEntity);
    return transformed;
  },
  async update(ctx) {
    const { id } = ctx.state.user;
    const [event] = await strapi.entityService.findMany("api::event.event", {
      filters: {
        id: ctx.request.params.id,
        user: id,
      },
      populate: "*",
    });
    if (event) {
      const response = await super.update(ctx);
      const sanitizedEntity = await this.sanitizeOutput(response, ctx);
      return sanitizedEntity;
    } else {
      return ctx.unauthorized(`You can't update this entry`);
    }
  },
  async delete(ctx) {
    const { id } = ctx.state.user;
    const [event] = await strapi.entityService.findMany("api::event.event", {
      filters: {
        id: ctx.request.params.id,
        user: id,
      },
    });
    if (event) {
      const response = await super.delete(ctx);
      return response;
    } else {
      return ctx.unauthorized(`You can't delete this entry`);
    }
  },
}));
